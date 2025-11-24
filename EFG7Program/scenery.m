function z=scenery(g,H,nit,np,w)   % C Bandt  Nov. 2025
% film of random magnifications of an IFS
% g,H numeration form of IFS, require H(:,3,1)=0 (control point)
% nit number of magnifications to be shown
% np length of pauses (seconds)
% w=vector deterministic choice of pieces, w=number random choice,
% w=0 uniform, w=3 good for finding dense neighborhoods 

rat=3;     % ratio of width of large and small window, can be chosen
x=globa(g,H); N=size(x,2);          % point cloud
m=size(H,3); z=zeros(2,nit); Lw=length(w);
a=(max(sum(x.^2)))^.5;              % radius of small square
b=rat*a; R=sqrt(det(g)); S=R*inv(g);     % constants

figure('menubar','none')    % draw first point cloud, pieces colored
s=[1 1 0;1 0 1;.8 .5 .5;.8 .7 .2;.8 .2 .7;.8 .8 .8]; % subpiece colors
for j=1:m;  t1=j:m:N;       % full-scale global picture 
     plot(x(1,t1),x(2,t1),'.','MarkerSize',1,'Color',s(j,:)); hold on
end; pause(np)              % bring picture to central position
rectangle('Position',[-a,-a,2*a,2*a])  % small square around reference
rectangle('Position',[-b,-b,2*b,2*b])  % large square is outer frame 
axis([-b,b,-b,b]); axis square; axis off % no coordinates 
D=eye(2); nb=[]; y=x;        % initial parameters 
 
for it=1:nit; pause(np)      % choose subpiece and draw it red       
 if Lw>1; i=w(it); if it==Lw; w=3; Lw=1; end  % to extend repeated run
 else i=greedychoice(g,H,nb,a,w); end     
 t1=i:m:N; plot(y(1,t1),y(2,t1),'r.','MarkerSize',.5); 
 rr=b/R;             % draw red square which will go to outer frame
 rectangle('Position',[y(1,i)-rr,y(2,i)-rr,2*rr,2*rr],'EdgeColor','r') 
 hold off; pause(np)   
 
 D=D*S*H(:,1:2,i);       % direction of new central piece
 na=nbmaps(g,H,i,nb,a+b); 
 n=size(na,3); corr=zeros(1,n); 
 plot(0,0,'w.'); hold on; axis off    % start plotting new image 
 for k=1:n                            % for each neighbor
     y=D*(na(:,1:2,k)*x+na(:,3,k));   % calculate neighbor cloud
     t1=max(abs(y(1:2,:)))<b;         % plot only points inside frame
     if sum(t1)>0;  corr(k)=1;
      plot(y(1,t1),y(2,t1),'.','MarkerSize',.5,'Color',[0 rand(1,2)])
     end             % neighbors randomly colored with blue and green
 end                 
 rectangle('Position',[-b,-b,2*b,2*b]); axis([-b,b,-b,b])
 rectangle('Position',[-a,-a,2*a,2*a]); axis square  % black squares
 y=D*x;                               % rotate central piece 
 for j=1:m;  t1=j:m:N;
     plot(y(1,t1),y(2,t1),'.','MarkerSize',1,'Color',s(j,:));  
 end                  % subpieces colored as in the initial step
 nb=na(:,:,corr==1);  % keep only neighbors which hit the screen 
 z(1,it)=i; z(2,it)=sum(corr); % save index of piece, number of neighbors
 disp([it z(2,it)]); if z(2,it)>1000; return; end   % emergency stop 
end 
