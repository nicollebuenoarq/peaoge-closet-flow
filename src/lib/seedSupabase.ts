import { supabaseStore } from './supabaseStore';
import type { Fornecedora, Venda, AppConfig } from '@/types';

const fornecedoras: Fornecedora[] = [
  { id: 'f1', nome: 'Joice', contato: '(31) 98368-3967', chavePix: '31983683967', observacoes: 'Socia', ativa: true, ehSocia: true },
  { id: 'f2', nome: 'Nicolle', contato: '(31) 99377-6577', chavePix: '31993776577', observacoes: 'Socia', ativa: true, ehSocia: true },
  { id: 'f3', nome: 'Larissa', contato: '', chavePix: '', observacoes: 'Socia', ativa: true, ehSocia: true },
  { id: 'f4', nome: 'Luiza', contato: '', chavePix: '', observacoes: '', ativa: true, ehSocia: false },
  { id: 'f5', nome: 'Luana Otoni', contato: '', chavePix: '', observacoes: '', ativa: true, ehSocia: false },
  { id: 'f6', nome: 'Marcilene', contato: '', chavePix: '', observacoes: '', ativa: true, ehSocia: false },
  { id: 'f7', nome: 'Thaynara', contato: '', chavePix: '', observacoes: '', ativa: true, ehSocia: false },
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pecas: any[] = [
  { sku:1, descricao:'Cropped Branco com drapeado', categoria:'Blusa', tamanho:'PP', fornecedoraId:'f3', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:2, descricao:'Cropped verde militar', categoria:'Blusa', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:3, descricao:'Cropped roxo', categoria:'Blusa', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:4, descricao:'Body YouCom', categoria:'Blusa', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-07', status:'Disponível', preco:10.0, drop:1 },
  { sku:5, descricao:'Blusa de frio cinza', categoria:'Blusa', tamanho:'P', fornecedoraId:'f1', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:6, descricao:'Saia courino', categoria:'Saia', tamanho:'P/M', fornecedoraId:'f3', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:7, descricao:'Cropped regata', categoria:'Blusa', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:8, descricao:'Short jeans Dzarm', categoria:'Jeans', tamanho:'38', fornecedoraId:'f1', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:9, descricao:'Cacharrel regata marrom', categoria:'Blusa', tamanho:'P/M', fornecedoraId:'f3', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:10, descricao:'Regata Zinzane', categoria:'Blusa', tamanho:'P', fornecedoraId:'f1', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:11, descricao:'Vestido midi malha', categoria:'Vestido', tamanho:'P', fornecedoraId:'f1', dataEntrada:'2026-03-07', status:'Disponível', preco:10.0, drop:1 },
  { sku:12, descricao:'Conjunto Biquini onca', categoria:'Biquini', tamanho:'M', fornecedoraId:'f1', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:13, descricao:'Short branco', categoria:'Short', tamanho:'40', fornecedoraId:'f3', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:14, descricao:'Cropped amarracao', categoria:'Blusa', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:15, descricao:'Cropped xadrez', categoria:'Blusa', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:16, descricao:'Cacharrel regata preta', categoria:'Blusa', tamanho:'P/M', fornecedoraId:'f3', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:17, descricao:'Cropped preto', categoria:'Blusa', tamanho:'G', fornecedoraId:'f3', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:18, descricao:'Saia longa fenda frontal', categoria:'Saia', tamanho:'P', fornecedoraId:'f1', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:19, descricao:'Calca crepe', categoria:'Calca', tamanho:'M', fornecedoraId:'f1', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:20, descricao:'short caqui', categoria:'Short', tamanho:'P', fornecedoraId:'f1', dataEntrada:'2026-03-07', status:'Disponível', preco:10.0, drop:1 },
  { sku:21, descricao:'Short saia bege', categoria:'Short-saia', tamanho:'P', fornecedoraId:'f1', dataEntrada:'2026-03-07', status:'Disponível', preco:10.0, drop:1 },
  { sku:22, descricao:'Saia midi preta', categoria:'Saia', tamanho:'P', fornecedoraId:'f1', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:23, descricao:'Cropped arco-iris', categoria:'Blusa', tamanho:'P', fornecedoraId:'f1', dataEntrada:'2026-03-07', status:'Disponível', preco:10.0, drop:1 },
  { sku:24, descricao:'Mini saia jeans', categoria:'Saia', tamanho:'38', fornecedoraId:'f1', dataEntrada:'2026-03-07', status:'Vendido', preco:10.0, drop:1 },
  { sku:25, descricao:'Blusa social rosa bebe', categoria:'Blusa', tamanho:'M', fornecedoraId:'f3', dataEntrada:'2026-03-08', status:'Vendido', preco:10.0, drop:1 },
  { sku:26, descricao:'Blusa com babados creme', categoria:'Blusa', tamanho:'M', fornecedoraId:'f3', dataEntrada:'2026-03-08', status:'Vendido', preco:10.0, drop:1 },
  { sku:27, descricao:'Blusa de frio Dudalina', categoria:'Blusa', tamanho:'M', fornecedoraId:'f3', dataEntrada:'2026-03-08', status:'Vendido', preco:10.0, drop:1 },
  { sku:28, descricao:'Calca cavalaria ziper aparente', categoria:'Calca', tamanho:'GG', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Disponível', preco:10.0, drop:1 },
  { sku:29, descricao:'Saia midi floral', categoria:'Saia', tamanho:'G', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Disponível', preco:10.0, drop:1 },
  { sku:30, descricao:'Short de malha estampado', categoria:'Short', tamanho:'M', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Disponível', preco:10.0, drop:1 },
  { sku:31, descricao:'Cropped never ever', categoria:'Blusa', tamanho:'P', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Disponível', preco:10.0, drop:1 },
  { sku:32, descricao:'Saia midi com fenda lateral', categoria:'Saia', tamanho:'G', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Disponível', preco:10.0, drop:1 },
  { sku:33, descricao:'Calca jeans wide leg', categoria:'Calca', tamanho:'44', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Vendido', preco:10.0, drop:1 },
  { sku:34, descricao:'Quimono floral', categoria:'Blusa', tamanho:'U', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Vendido', preco:10.0, drop:1 },
  { sku:35, descricao:'Blusa ombro a ombro listrada', categoria:'Blusa', tamanho:'M', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Disponível', preco:10.0, drop:1 },
  { sku:36, descricao:'Vestido jeans de botao', categoria:'Vestido', tamanho:'M', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Vendido', preco:10.0, drop:1 },
  { sku:37, descricao:'Vestido preto floral', categoria:'Vestido', tamanho:'M', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Vendido', preco:10.0, drop:1 },
  { sku:38, descricao:'Body modelador Dr Rey', categoria:'Body', tamanho:'PP', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Disponível', preco:10.0, drop:1 },
  { sku:39, descricao:'Short jeans', categoria:'Short', tamanho:'42', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Vendido', preco:10.0, drop:1 },
  { sku:40, descricao:'Vestido de festa com brilhos', categoria:'Vestido', tamanho:'42', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Vendido', preco:10.0, drop:1 },
  { sku:41, descricao:'Vestido com estampa etnica', categoria:'Vestido', tamanho:'P', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Vendido', preco:10.0, drop:1 },
  { sku:42, descricao:'Calca de veludo pink', categoria:'Calca', tamanho:'P', fornecedoraId:'f2', dataEntrada:'2026-03-08', status:'Disponível', preco:10.0, drop:1 },  { sku:43, descricao:'Vestido midi crepe com pregas', categoria:'Vestido', tamanho:'G', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:40.0, drop:0 },
  { sku:44, descricao:'Conjunto cropped saia cintura alta', categoria:'Cropped e saia', tamanho:'G', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:50.0, drop:2 },
  { sku:45, descricao:'Saia cintura alta animal print', categoria:'Saia', tamanho:'GG', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:15.0, drop:2 },
  { sku:46, descricao:'Calca jeans azul wide leg', categoria:'Calca', tamanho:'46', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Vendido', preco:35.0, drop:2 },
  { sku:47, descricao:'Saia preta floral', categoria:'Saia', tamanho:'GG', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Vendido', preco:20.0, drop:2 },
  { sku:48, descricao:'Quimono florido com franjas', categoria:'Quimono', tamanho:'U', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:20.0, drop:2 },
  { sku:49, descricao:'Conjunto short e camisa floral', categoria:'Conjunto', tamanho:'G', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:35.0, drop:2 },
  { sku:50, descricao:'Vestido listrado', categoria:'Vestido', tamanho:'G', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:40.0, drop:2 },
  { sku:51, descricao:'Vestido manga preto com flores', categoria:'Vestido', tamanho:'M/G', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:25.0, drop:3 },
  { sku:52, descricao:'Camisa social de crepe com pregas', categoria:'Camisa social', tamanho:'M', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:15.0, drop:3 },
  { sku:53, descricao:'Body canelado com ziper', categoria:'Body', tamanho:'GG', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:20.0, drop:3 },
  { sku:54, descricao:'Short xadrez', categoria:'Short', tamanho:'GG', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:10.0, drop:0 },
  { sku:55, descricao:'Cropped estampa etnica', categoria:'Cropped', tamanho:'G', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:10.0, drop:3 },
  { sku:56, descricao:'Cropped social estampado', categoria:'Cropped', tamanho:'G', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:20.0, drop:3 },
  { sku:57, descricao:'Blusa de frio de la', categoria:'Blusa de frio', tamanho:'M', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:15.0, drop:0 },
  { sku:58, descricao:'Quimono floral branco', categoria:'Quimono', tamanho:'U', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:12.0, drop:3 },
  { sku:59, descricao:'Short estampado', categoria:'Short', tamanho:'M', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:10.0, drop:0 },
  { sku:60, descricao:'Cropped com elastico', categoria:'Cropped', tamanho:'G', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:15.0, drop:3 },
  { sku:61, descricao:'Camisa listrada', categoria:'Camisa', tamanho:'G', fornecedoraId:'f2', dataEntrada:'2026-03-11', status:'Disponível', preco:20.0, drop:3 },
  { sku:62, descricao:'Cropped preto abertura frontal', categoria:'Cropped', tamanho:'M', fornecedoraId:'f4', dataEntrada:'2026-03-12', status:'Disponível', preco:20.0, drop:2 },
  { sku:63, descricao:'Bata de alcinha com bojo verde', categoria:'Blusa', tamanho:'M', fornecedoraId:'f4', dataEntrada:'2026-03-12', status:'Vendido', preco:25.0, drop:2 },
  { sku:64, descricao:'Cropped malha canelada azul', categoria:'Cropped', tamanho:'P/M', fornecedoraId:'f4', dataEntrada:'2026-03-12', status:'Disponível', preco:15.0, drop:2 },
  { sku:65, descricao:'Cropped malha canelada rosa', categoria:'Cropped', tamanho:'M', fornecedoraId:'f4', dataEntrada:'2026-03-12', status:'Disponível', preco:15.0, drop:2 },
  { sku:66, descricao:'Jaqueta jeans amarela', categoria:'Jeans', tamanho:'M/G', fornecedoraId:'f4', dataEntrada:'2026-03-12', status:'Disponível', preco:40.0, drop:0 },
  { sku:67, descricao:'Top manga balona tricoline branco', categoria:'Blusa', tamanho:'M', fornecedoraId:'f4', dataEntrada:'2026-03-12', status:'Disponível', preco:30.0, drop:2 },
  { sku:68, descricao:'Vestido malha pointelle branco', categoria:'Vestido', tamanho:'M', fornecedoraId:'f4', dataEntrada:'2026-03-12', status:'Vendido', preco:50.0, drop:2 },
  { sku:69, descricao:'saia branca fenda dupla', categoria:'Saia', tamanho:'P/M', fornecedoraId:'f5', dataEntrada:'2026-03-12', status:'Vendido', preco:25.0, drop:2 },
  { sku:70, descricao:'short jeans claro', categoria:'Short', tamanho:'36', fornecedoraId:'f5', dataEntrada:'2026-03-12', status:'Disponível', preco:20.0, drop:2 },
  { sku:71, descricao:'pantalona estampada', categoria:'Calca', tamanho:'P', fornecedoraId:'f5', dataEntrada:'2026-03-12', status:'Vendido', preco:35.0, drop:2 },
  { sku:72, descricao:'vestido tucanos', categoria:'Vestido', tamanho:'P', fornecedoraId:'f5', dataEntrada:'2026-03-12', status:'Vendido', preco:45.0, drop:2 },
  { sku:73, descricao:'macacao listrado', categoria:'Macacao', tamanho:'M', fornecedoraId:'f5', dataEntrada:'2026-03-12', status:'Disponível', preco:20.0, drop:2 },
  { sku:74, descricao:'Cropped amarracao', categoria:'Cropped', tamanho:'P', fornecedoraId:'f5', dataEntrada:'2026-03-12', status:'Disponível', preco:20.0, drop:2 },
  { sku:75, descricao:'Vestido vinho', categoria:'Vestido', tamanho:'P', fornecedoraId:'f6', dataEntrada:'2026-03-12', status:'Vendido', preco:25.0, drop:2 },
  { sku:76, descricao:'Vestido rosa de linho', categoria:'Vestido', tamanho:'M', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:35.0, drop:2 },
  { sku:77, descricao:'Macaquinho branco', categoria:'Macaquinho', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:20.0, drop:2 },
  { sku:78, descricao:'Saia listrada', categoria:'Saia', tamanho:'38', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:25.0, drop:2 },
  { sku:79, descricao:'Saia corino', categoria:'Saia', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:20.0, drop:2 },
  { sku:80, descricao:'Macaquinho marsala', categoria:'Macaquinho', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:25.0, drop:2 },
  { sku:81, descricao:'Cropped azul com elastico', categoria:'Cropped', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:10.0, drop:0 },
  { sku:82, descricao:'body preto rendado', categoria:'Body', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:20.0, drop:2 },
  { sku:83, descricao:'Blazer cinza', categoria:'Blazer', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:30.0, drop:2 },
  { sku:84, descricao:'Vestido preto curto', categoria:'Vestido', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:20.0, drop:0 },
  { sku:85, descricao:'Saia de bolinha', categoria:'Saia', tamanho:'40', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Vendido', preco:20.0, drop:2 },
  { sku:86, descricao:'Short jeans', categoria:'Short', tamanho:'44', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:30.0, drop:0 },
  { sku:87, descricao:'Camisa jeans', categoria:'Camisa', tamanho:'P/M', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:20.0, drop:0 },
  { sku:88, descricao:'Vestido marrom solto', categoria:'Vestido', tamanho:'P', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Vendido', preco:25.0, drop:2 },
  { sku:89, descricao:'Vestido frente unica estampa etnica', categoria:'Vestido', tamanho:'P', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:0, drop:0 },
  { sku:90, descricao:'Cropped preto', categoria:'Cropped', tamanho:'P', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:15.0, drop:0 },
  { sku:91, descricao:'Cropped preto lurex', categoria:'Cropped', tamanho:'P', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:20.0, drop:0 },
  { sku:92, descricao:'Blusa transpassada', categoria:'Blusa', tamanho:'P', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:25.0, drop:0 },
  { sku:93, descricao:'Regata cropped', categoria:'Regata', tamanho:'P', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:10.0, drop:0 },
  { sku:94, descricao:'Short jeans', categoria:'Short', tamanho:'36', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:25.0, drop:2 },
  { sku:95, descricao:'Camisa cropped blue steel oncinha', categoria:'Cropped', tamanho:'P', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:25.0, drop:2 },
  { sku:96, descricao:'Vestido manga bufante', categoria:'Vestido', tamanho:'P', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:20.0, drop:0 },
  { sku:97, descricao:'Short Zara', categoria:'Short', tamanho:'36', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:25.0, drop:2 },
  { sku:98, descricao:'Short Jeans blue steel claro', categoria:'Short', tamanho:'36', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Vendido', preco:25.0, drop:2 },
  { sku:99, descricao:'Saia jeans claro', categoria:'Saia', tamanho:'36', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:30.0, drop:0 },
  { sku:100, descricao:'Short Jeans preto', categoria:'Short', tamanho:'36', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:20.0, drop:0 },
  { sku:101, descricao:'Calca jeans skinny azul clara', categoria:'Calca jeans', tamanho:'38', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:30.0, drop:2 },
  { sku:102, descricao:'Calca jeans skinny azul escura', categoria:'Calca jeans', tamanho:'38', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:20.0, drop:0 },
  { sku:103, descricao:'Macacao academia preto', categoria:'Macacao', tamanho:'P', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Vendido', preco:30.0, drop:2 },
  { sku:104, descricao:'Macaquinho academia', categoria:'Macaquinho', tamanho:'P', fornecedoraId:'f7', dataEntrada:'2026-03-13', status:'Disponível', preco:30.0, drop:0 },
  { sku:105, descricao:'Blusa ciganinha bege', categoria:'Blusa', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:10.0, drop:0 },
  { sku:106, descricao:'Short saia verde agua', categoria:'Short saia', tamanho:'P', fornecedoraId:'f3', dataEntrada:'2026-03-13', status:'Disponível', preco:20.0, drop:0 },
  { sku:107, descricao:'Saia transpassada linho', categoria:'Saia', tamanho:'M', fornecedoraId:'f1', dataEntrada:'2026-03-14', status:'Disponível', preco:40.0, drop:2 },
  { sku:108, descricao:'Cropped Ciganinha Mostarda', categoria:'Cropped', tamanho:'M', fornecedoraId:'f1', dataEntrada:'2026-03-14', status:'Disponível', preco:15.0, drop:2 },
  { sku:109, descricao:'Vestido de festa preto amarracao', categoria:'Vestido', tamanho:'M', fornecedoraId:'f6', dataEntrada:'2026-03-14', status:'Disponível', preco:45.0, drop:2 },
  { sku:110, descricao:'Calca de sarja verde militar', categoria:'Calca', tamanho:'38', fornecedoraId:'f6', dataEntrada:'2026-03-14', status:'Disponível', preco:35.0, drop:2 },
  { sku:111, descricao:'Short alfaiataria rosa', categoria:'Short', tamanho:'M', fornecedoraId:'f6', dataEntrada:'2026-03-14', status:'Disponível', preco:35.0, drop:2 },
  { sku:112, descricao:'Blusa de alcinha estampa', categoria:'Blusa', tamanho:'P/M', fornecedoraId:'f6', dataEntrada:'2026-03-14', status:'Disponível', preco:20.0, drop:2 },
  { sku:113, descricao:'Bata cetim de poliester', categoria:'Blusa', tamanho:'G', fornecedoraId:'f6', dataEntrada:'2026-03-14', status:'Disponível', preco:30.0, drop:2 },
  { sku:114, descricao:'Vestido frente unica', categoria:'Vestido', tamanho:'M', fornecedoraId:'f1', dataEntrada:'2026-03-14', status:'Disponível', preco:40.0, drop:2 },
];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vendas: any[] = [
  { id:'v1', dataVenda:'2026-03-08', skuPeca:26, descricaoPeca:'Blusa com babados creme', fornecedoraId:'f3', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Luiza', enderecoEntrega:'VPR', dataEntrega:null },
  { id:'v2', dataVenda:'2026-03-08', skuPeca:3, descricaoPeca:'Cropped roxo', fornecedoraId:'f3', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Luiza', enderecoEntrega:'VPR', dataEntrega:null },
  { id:'v3', dataVenda:'2026-03-08', skuPeca:40, descricaoPeca:'Vestido de festa com brilhos', fornecedoraId:'f2', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Luiza', enderecoEntrega:'VPR', dataEntrega:null },
  { id:'v4', dataVenda:'2026-03-08', skuPeca:1, descricaoPeca:'Cropped Branco com drapeado', fornecedoraId:'f3', drop:1, desconto:2.0, precoFinal:8.0, pagamento:'Pix', comissaoFornecedora:4.8, parcelaBrecho:3.2, pagoFornecedora:true, dataPagamento:null, compradora:'Tailane', enderecoEntrega:'', dataEntrega:null },
  { id:'v5', dataVenda:'2026-03-08', skuPeca:7, descricaoPeca:'Cropped regata', fornecedoraId:'f3', drop:1, desconto:2.0, precoFinal:8.0, pagamento:'Pix', comissaoFornecedora:4.8, parcelaBrecho:3.2, pagoFornecedora:true, dataPagamento:null, compradora:'Tailane', enderecoEntrega:'', dataEntrega:null },
  { id:'v6', dataVenda:'2026-03-08', skuPeca:18, descricaoPeca:'Saia longa fenda frontal', fornecedoraId:'f1', drop:1, desconto:2.0, precoFinal:8.0, pagamento:'Pix', comissaoFornecedora:4.8, parcelaBrecho:3.2, pagoFornecedora:true, dataPagamento:null, compradora:'Tailane', enderecoEntrega:'', dataEntrega:null },
  { id:'v7', dataVenda:'2026-03-08', skuPeca:36, descricaoPeca:'Vestido jeans de botao', fornecedoraId:'f2', drop:1, desconto:2.0, precoFinal:8.0, pagamento:'Pix', comissaoFornecedora:4.8, parcelaBrecho:3.2, pagoFornecedora:true, dataPagamento:null, compradora:'Tailane', enderecoEntrega:'', dataEntrega:null },
  { id:'v8', dataVenda:'2026-03-08', skuPeca:41, descricaoPeca:'Vestido com estampa etnica', fornecedoraId:'f2', drop:1, desconto:2.0, precoFinal:8.0, pagamento:'Pix', comissaoFornecedora:4.8, parcelaBrecho:3.2, pagoFornecedora:true, dataPagamento:null, compradora:'Tailane', enderecoEntrega:'', dataEntrega:null },
  { id:'v9', dataVenda:'2026-03-08', skuPeca:2, descricaoPeca:'Cropped verde militar', fornecedoraId:'f3', drop:1, desconto:2.0, precoFinal:8.0, pagamento:'Pix', comissaoFornecedora:4.8, parcelaBrecho:3.2, pagoFornecedora:true, dataPagamento:null, compradora:'Lorena', enderecoEntrega:'VPR', dataEntrega:null },
  { id:'v10', dataVenda:'2026-03-08', skuPeca:9, descricaoPeca:'Cacharrel regata marrom', fornecedoraId:'f3', drop:1, desconto:2.0, precoFinal:8.0, pagamento:'Pix', comissaoFornecedora:4.8, parcelaBrecho:3.2, pagoFornecedora:true, dataPagamento:null, compradora:'Lorena', enderecoEntrega:'VPR', dataEntrega:null },
  { id:'v11', dataVenda:'2026-03-08', skuPeca:14, descricaoPeca:'Cropped amarracao', fornecedoraId:'f3', drop:1, desconto:2.0, precoFinal:8.0, pagamento:'Pix', comissaoFornecedora:4.8, parcelaBrecho:3.2, pagoFornecedora:true, dataPagamento:null, compradora:'Lorena', enderecoEntrega:'VPR', dataEntrega:null },
  { id:'v12', dataVenda:'2026-03-08', skuPeca:16, descricaoPeca:'Cacharrel regata preta', fornecedoraId:'f3', drop:1, desconto:2.0, precoFinal:8.0, pagamento:'Pix', comissaoFornecedora:4.8, parcelaBrecho:3.2, pagoFornecedora:true, dataPagamento:null, compradora:'Lorena', enderecoEntrega:'VPR', dataEntrega:null },
  { id:'v13', dataVenda:'2026-03-08', skuPeca:34, descricaoPeca:'Quimono floral', fornecedoraId:'f2', drop:1, desconto:2.0, precoFinal:8.0, pagamento:'Pix', comissaoFornecedora:4.8, parcelaBrecho:3.2, pagoFornecedora:true, dataPagamento:null, compradora:'Lorena', enderecoEntrega:'VPR', dataEntrega:null },
  { id:'v14', dataVenda:'2026-03-08', skuPeca:6, descricaoPeca:'Saia courino', fornecedoraId:'f3', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Maria Loyola', enderecoEntrega:'Santa Monica', dataEntrega:'2026-03-10' },
  { id:'v15', dataVenda:'2026-03-08', skuPeca:22, descricaoPeca:'Saia midi preta', fornecedoraId:'f1', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Maria Loyola', enderecoEntrega:'Santa Monica', dataEntrega:'2026-03-10' },
  { id:'v16', dataVenda:'2026-03-08', skuPeca:39, descricaoPeca:'Short jeans', fornecedoraId:'f2', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Maria Loyola', enderecoEntrega:'Santa Monica', dataEntrega:'2026-03-10' },
  { id:'v17', dataVenda:'2026-03-08', skuPeca:10, descricaoPeca:'Regata Zinzane', fornecedoraId:'f1', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Isabela', enderecoEntrega:'Santa Monica', dataEntrega:'2026-03-10' },
  { id:'v18', dataVenda:'2026-03-08', skuPeca:25, descricaoPeca:'Blusa social rosa bebe', fornecedoraId:'f3', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Isabela', enderecoEntrega:'Santa Monica', dataEntrega:'2026-03-10' },
  { id:'v19', dataVenda:'2026-03-08', skuPeca:27, descricaoPeca:'Blusa de frio Dudalina', fornecedoraId:'f3', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Isabela', enderecoEntrega:'Rua Astecas 2619', dataEntrega:'2026-03-10' },
  { id:'v20', dataVenda:'2026-03-08', skuPeca:33, descricaoPeca:'Calca jeans wide leg', fornecedoraId:'f2', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Anna', enderecoEntrega:'VPR', dataEntrega:null },
  { id:'v21', dataVenda:'2026-03-08', skuPeca:24, descricaoPeca:'Mini saia jeans', fornecedoraId:'f1', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Raquel Rocha', enderecoEntrega:'Santa Monica', dataEntrega:null },
  { id:'v22', dataVenda:'2026-03-08', skuPeca:8, descricaoPeca:'Short jeans Dzarm', fornecedoraId:'f1', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Raquel Rocha', enderecoEntrega:'Santa Monica', dataEntrega:null },
  { id:'v23', dataVenda:'2026-03-08', skuPeca:13, descricaoPeca:'Short branco', fornecedoraId:'f3', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Raquel Rocha', enderecoEntrega:'Santa Monica', dataEntrega:null },
  { id:'v24', dataVenda:'2026-03-08', skuPeca:37, descricaoPeca:'Vestido preto floral', fornecedoraId:'f2', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Raquel Rocha', enderecoEntrega:'Santa Monica', dataEntrega:null },
  { id:'v25', dataVenda:'2026-03-08', skuPeca:19, descricaoPeca:'Calca crepe', fornecedoraId:'f1', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Sarah Maestro', enderecoEntrega:'', dataEntrega:null },
  { id:'v26', dataVenda:'2026-03-08', skuPeca:17, descricaoPeca:'Cropped preto', fornecedoraId:'f3', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Sarah Maestro', enderecoEntrega:'', dataEntrega:null },
  { id:'v27', dataVenda:'2026-03-08', skuPeca:5, descricaoPeca:'Blusa de frio cinza', fornecedoraId:'f1', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Sarah Maestro', enderecoEntrega:'', dataEntrega:null },
  { id:'v28', dataVenda:'2026-03-08', skuPeca:15, descricaoPeca:'Cropped xadrez', fornecedoraId:'f3', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Sarah Maestro', enderecoEntrega:'', dataEntrega:null },
  { id:'v29', dataVenda:'2026-03-08', skuPeca:12, descricaoPeca:'Conjunto Biquini onca', fornecedoraId:'f1', drop:1, desconto:0, precoFinal:10.0, pagamento:'Pix', comissaoFornecedora:6.0, parcelaBrecho:4.0, pagoFornecedora:true, dataPagamento:null, compradora:'Carol', enderecoEntrega:'Santa Monica', dataEntrega:null },
  { id:'v30', dataVenda:'2026-03-15', skuPeca:46, descricaoPeca:'Calca jeans azul wide leg', fornecedoraId:'f2', drop:2, desconto:0, precoFinal:35.0, pagamento:'Pix', comissaoFornecedora:21.0, parcelaBrecho:14.0, pagoFornecedora:false, dataPagamento:null, compradora:'Anna', enderecoEntrega:'Buritis', dataEntrega:null },
  { id:'v31', dataVenda:'2026-03-15', skuPeca:47, descricaoPeca:'Saia preta floral', fornecedoraId:'f2', drop:2, desconto:0, precoFinal:20.0, pagamento:'Pix', comissaoFornecedora:12.0, parcelaBrecho:8.0, pagoFornecedora:false, dataPagamento:null, compradora:'Anna', enderecoEntrega:'Buritis', dataEntrega:null },
  { id:'v32', dataVenda:'2026-03-15', skuPeca:68, descricaoPeca:'Vestido malha pointelle branco', fornecedoraId:'f4', drop:2, desconto:0, precoFinal:50.0, pagamento:'Pix', comissaoFornecedora:30.0, parcelaBrecho:20.0, pagoFornecedora:false, dataPagamento:null, compradora:'Lorena', enderecoEntrega:'Buritis', dataEntrega:null },
  { id:'v33', dataVenda:'2026-03-15', skuPeca:85, descricaoPeca:'Saia de bolinha', fornecedoraId:'f3', drop:2, desconto:0, precoFinal:20.0, pagamento:'Pix', comissaoFornecedora:12.0, parcelaBrecho:8.0, pagoFornecedora:false, dataPagamento:null, compradora:'Juliana Rocha', enderecoEntrega:'Santa Monica', dataEntrega:null },
  { id:'v34', dataVenda:'2026-03-15', skuPeca:103, descricaoPeca:'Macacao academia preto', fornecedoraId:'f7', drop:2, desconto:0, precoFinal:30.0, pagamento:'Pix', comissaoFornecedora:18.0, parcelaBrecho:12.0, pagoFornecedora:false, dataPagamento:null, compradora:'Juliana Rocha', enderecoEntrega:'Santa Monica', dataEntrega:null },
  { id:'v35', dataVenda:'2026-03-15', skuPeca:71, descricaoPeca:'pantalona estampada', fornecedoraId:'f5', drop:2, desconto:0, precoFinal:35.0, pagamento:'Pix', comissaoFornecedora:21.0, parcelaBrecho:14.0, pagoFornecedora:false, dataPagamento:null, compradora:'Raquel Rocha', enderecoEntrega:'Santa Monica', dataEntrega:null },
  { id:'v36', dataVenda:'2026-03-15', skuPeca:88, descricaoPeca:'Vestido marrom solto', fornecedoraId:'f7', drop:2, desconto:0, precoFinal:25.0, pagamento:'Pix', comissaoFornecedora:15.0, parcelaBrecho:10.0, pagoFornecedora:false, dataPagamento:null, compradora:'Gabi', enderecoEntrega:'Santa Monica', dataEntrega:null },
  { id:'v37', dataVenda:'2026-03-15', skuPeca:98, descricaoPeca:'Short Jeans blue steel claro', fornecedoraId:'f7', drop:2, desconto:0, precoFinal:25.0, pagamento:'Pix', comissaoFornecedora:15.0, parcelaBrecho:10.0, pagoFornecedora:false, dataPagamento:null, compradora:'Camilla', enderecoEntrega:'Buritis', dataEntrega:null },
  { id:'v38', dataVenda:'2026-03-16', skuPeca:69, descricaoPeca:'saia branca fenda dupla', fornecedoraId:'f5', drop:2, desconto:0, precoFinal:25.0, pagamento:'Pix', comissaoFornecedora:15.0, parcelaBrecho:10.0, pagoFornecedora:false, dataPagamento:null, compradora:'Roberta', enderecoEntrega:'sacolinha', dataEntrega:null },
  { id:'v39', dataVenda:'2026-03-18', skuPeca:75, descricaoPeca:'Vestido vinho', fornecedoraId:'f6', drop:2, desconto:0, precoFinal:25.0, pagamento:'Pix', comissaoFornecedora:15.0, parcelaBrecho:10.0, pagoFornecedora:false, dataPagamento:null, compradora:'Maria Loyola', enderecoEntrega:'', dataEntrega:null },
  { id:'v40', dataVenda:'2026-03-18', skuPeca:63, descricaoPeca:'Bata de alcinha bojo verde', fornecedoraId:'f4', drop:2, desconto:0, precoFinal:25.0, pagamento:'Pix', comissaoFornecedora:15.0, parcelaBrecho:10.0, pagoFornecedora:false, dataPagamento:null, compradora:'Isabela', enderecoEntrega:'', dataEntrega:null },
  { id:'v41', dataVenda:'2026-03-19', skuPeca:72, descricaoPeca:'vestido tucanos', fornecedoraId:'f5', drop:2, desconto:0, precoFinal:45.0, pagamento:'Pix', comissaoFornecedora:27.0, parcelaBrecho:18.0, pagoFornecedora:false, dataPagamento:null, compradora:'Gabi Duarte', enderecoEntrega:'sacolinha', dataEntrega:null },
];

const config: AppConfig = {
  percentualFornecedora: 0.60,
  percentualBrecho: 0.40,
  taxaCartao: 0.05,
  dropAtual: 3,
  statusValidos: ['Disponível', 'Vendido', 'Devolvido', 'Reservado'],
  meiosPagamento: ['Dinheiro', 'Pix', 'Cartão Crédito', 'Cartão Débito', 'Transferência'],
};

/**
 * Popula o Supabase com os dados iniciais do brechó.
 * É chamado automaticamente pelo App.tsx na primeira carga.
 * Verifica se o banco já tem dados antes de inserir.
 */
export async function seedSupabase(): Promise<void> {
  console.log('[seedSupabase] Verificando banco...');
  const initialized = await supabaseStore.isInitialized();
  if (initialized) {
    console.log('[seedSupabase] Banco ja populado. Nada a fazer.');
    return;
  }
  console.log('[seedSupabase] Banco vazio. Iniciando seed...');
  try {
    await supabaseStore.setFornecedoras(fornecedoras);
    await supabaseStore.setPecas(pecas);
    await supabaseStore.setVendas(vendas);
    await supabaseStore.setConfig(config);
    await supabaseStore.setNextSku(115);
    console.log('[seedSupabase] Seed concluido com sucesso!');
  } catch (err) {
    console.error('[seedSupabase] Erro durante o seed:', err);
    throw err;
  }
  }
